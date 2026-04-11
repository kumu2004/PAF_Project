package com.smartcampus.backend.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import com.smartcampus.backend.common.enums.UserRole;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

import java.util.List;

/**
 * explicitly configures MongoDB to bypass Spring Boot auto-config bugs
 * that were causing it to fallback to localhost:27017.
 */
@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Override
    protected String getDatabaseName() {
        // Parse from URI or default to pafproject
        if (mongoUri != null && mongoUri.contains("/")) {
            String db = mongoUri.substring(mongoUri.lastIndexOf("/") + 1);
            if (db.contains("?")) {
                db = db.substring(0, db.indexOf("?"));
            }
            if (!db.isEmpty()) return db;
        }
        return "pafproject";
    }

    @Override
    public MongoClient mongoClient() {
        ConnectionString connectionString = new ConnectionString(mongoUri);
        MongoClientSettings mongoClientSettings = MongoClientSettings.builder()
            .applyConnectionString(connectionString)
            .build();
        return MongoClients.create(mongoClientSettings);
    }

    /**
     * Backward-compatible enum mapping for legacy Mongo values.
     * Some existing user records may have "role": "STAFF_MEMBER" stored.
     * We map it to LECTURER to avoid breaking reads.
     */
    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(List.of(new StringToUserRoleConverter()));
    }

    @ReadingConverter
    static class StringToUserRoleConverter implements Converter<String, UserRole> {
        @Override
        public UserRole convert(String source) {
            if (source == null) return null;
            String v = source.trim();
            if (v.equalsIgnoreCase("STAFF_MEMBER")) {
                return UserRole.LECTURER;
            }
            return UserRole.valueOf(v);
        }
    }
}
